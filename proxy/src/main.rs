use hudsucker::{
    async_trait::async_trait,
    certificate_authority::RcgenAuthority,
    hyper::{Body, Request, Response},
    rustls, HttpContext, HttpHandler, ProxyBuilder, RequestOrResponse,
};

use log::*;
use rcgen::*;
use rustls_pemfile as pemfile;
use std::fs;
use std::net::SocketAddr;
use std::path::Path;

async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("Failed to install CTRL+C signal handler");
}

#[derive(Clone)]
struct TransactionRequestHandler {}

struct CAInfo {
    key: String,
    cert: String,
}

#[async_trait]
impl HttpHandler for TransactionRequestHandler {
    async fn handle_request(
        &mut self,
        _ctx: &HttpContext,
        req: Request<Body>,
    ) -> RequestOrResponse {
        if req.uri().host().unwrap() == "mein.gebuhrenfrei.com"
            && req.uri().path() == "/api/transaction-manager/client-api/v2/transactions"
        {
            println!("{:?}", req.uri().path());
        }
        RequestOrResponse::Request(req)
    }

    async fn handle_response(&mut self, _ctx: &HttpContext, res: Response<Body>) -> Response<Body> {
        res
    }
}

fn gen_ca() -> CAInfo {
    let mut params = CertificateParams::default();
    let mut dn = DistinguishedName::new();
    dn.push(DnType::CommonName, "advanzia-assistant-proxy");
    dn.push(DnType::OrganizationName, "advanzia-assistant-proxy");
    dn.push(DnType::CountryName, "DE");
    dn.push(DnType::LocalityName, "HH");
    params.key_usages = vec![
        KeyUsagePurpose::DigitalSignature,
        KeyUsagePurpose::KeyCertSign,
        KeyUsagePurpose::CrlSign,
    ];
    params.is_ca = IsCa::Ca(BasicConstraints::Unconstrained);
    let cert = Certificate::from_params(params).unwrap();
    let cert_crt = cert.serialize_pem().unwrap();
    let key = cert.serialize_private_key_pem();

    CAInfo {
        key,
        cert: cert_crt,
    }
}

#[tokio::main]
async fn main() {
    env_logger::init();

    if !Path::new("ca.crt").exists() || !Path::new("ca.key").exists() {
        let ca = gen_ca();

        if let Err(err) = fs::write("ca.crt", ca.cert) {
            error!("cert file write failed: {}", err);
        }

        if let Err(err) = fs::write("ca.key", ca.key) {
            error!("private key file write failed: {}", err);
        }

        println!("Please add certificate to trusted");
        return;
    }

    let private_key = rustls::PrivateKey(
        pemfile::pkcs8_private_keys(&mut fs::read("ca.key").unwrap().as_slice())
            .expect("Failed to parse private key")
            .remove(0),
    );
    let ca_cert = rustls::Certificate(
        pemfile::certs(&mut fs::read("ca.crt").unwrap().as_slice())
            .expect("Failed to parse CA certificate")
            .remove(0),
    );

    let ca = RcgenAuthority::new(private_key, ca_cert, 1_000)
        .expect("Failed to create Certificate Authority");
    let proxy = ProxyBuilder::new()
        .with_addr(SocketAddr::from(([127, 0, 0, 1], 3000)))
        .with_rustls_client()
        .with_ca(ca)
        .with_http_handler(TransactionRequestHandler {})
        .build();

    if let Err(e) = proxy.start(shutdown_signal()).await {
        error!("{}", e);
    }
}
