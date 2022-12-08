function showAlert(text, type, selector) {
  const span = document.createElement("span");
  span.innerHTML = text;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn-close";
  button.setAttribute("data-bs-dismiss", "alert");
  button.setAttribute("aria-label", "Close");

  const div = document.createElement("div");
  div.className = `alert alert-${type} alert-dismissible fade show my-3`;
  div.setAttribute("role", "alert");

  div.appendChild(span);
  div.appendChild(button);

  document.querySelector(selector).appendChild(div);
}

function hideElement(selector) {
  document.querySelector(selector).classList.add("visually-hidden");
}

function revealElement(selector) {
  document.querySelector(selector).classList.remove("visually-hidden");
}

window.onload = () => {
  const createCerts = document.querySelector("#create-certs");
  const createSubdomain = document.querySelector("#create-subdomain");

  createSubdomain.addEventListener("click", async () => {
    const createSubdomainText = document.querySelector(
      "#create-subdomain-text"
    );

    createSubdomain.disabled = true;
    createSubdomainText.innerText = "Creating Subdomain...";
    revealElement("#create-subdomain-spinner");

    const hostname = document.querySelector("#subdomain-hostname").value;
    const type = document.querySelector("#subdomain-type").value;
    const value = document.querySelector("#subdomain-value").value;

    let url;
    if (type === "A") {
      url = `/api/subdomains/${hostname}/a/${value}`;
    } else {
      url = `/api/subdomains/${hostname}/cname/${value}`;
    }

    try {
      if (!(hostname.length && value.length)) {
        throw new Error("Missing hostname and/or ip/domain");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(`Unable to create subdomain: ${error}`);
      }
      const subdomain = await res.json();
      showAlert(
        `Subdomain <code>${subdomain}</code> created successfully!`,
        "success",
        "#subdomain-result"
      );
    } catch (err) {
      showAlert(
        `Error creating subdomain: ${err.message}`,
        "danger",
        "#subdomain-result"
      );
      console.error(err);
    } finally {
      createSubdomain.disabled = false;
      createSubdomainText.innerText = "Create Subdomain";
      hideElement("#create-subdomain-spinner");
    }
  });

  createCerts.addEventListener("click", async () => {
    const createCertsText = document.querySelector("#create-certs-text");

    createCerts.disabled = true;
    createCertsText.innerText = "Creating Certs...";
    revealElement("#create-certs-spinner");

    function showCerts(certs) {
      document.querySelector("#certs-form-domain").value = certs.domain;
      document.querySelector("#certs-form-cert").value = certs.cert;
      document.querySelector("#certs-form-csr").value = certs.csr;
      document.querySelector("#certs-form-private-key").value =
        certs.privateKey;
      revealElement("#certs-form");
    }

    try {
      const res = await fetch("/api/certs");
      if (!res.ok) {
        throw new Error("Unable to generate certs");
      }
      const certs = await res.json();
      showAlert(
        `Certificates created successfully!`,
        "success",
        "#certs-result"
      );
      showCerts(certs);
      console.log({ certs });
    } catch (err) {
      showAlert(
        `Error creating certificates: ${err.message}`,
        "danger",
        "#certs-result"
      );
      console.error(err);
    } finally {
      createCerts.disabled = false;
      createCertsText.innerText = "Create Certs";
      hideElement("#create-certs-spinner");
    }
  });
};
