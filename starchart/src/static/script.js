function hideElement(selector) {
    document.querySelector(selector).classList.add('visually-hidden');
}

function revealElement(selector) {
    document.querySelector(selector).classList.remove('visually-hidden');
}

function showError(err) {
    const certsErrorText = document.querySelector('#certs-error-text');
    certsErrorText.innerText = err.message;
    revealElement('#certs-error');
    console.error(err);
}

function showCerts(certs) {
    document.querySelector('#certs-form-domain').value = certs.domain;
    document.querySelector('#certs-form-cert').value = certs.cert;
    document.querySelector('#certs-form-csr').value = certs.csr;
    document.querySelector('#certs-form-private-key').value = certs.privateKey;
    revealElement('#certs-form');
}

window.onload = () => {
    const createCerts = document.querySelector('#create-certs');
    const createCertsText = document.querySelector('#create-certs-text');

    createCerts.addEventListener('click', async () => {
        createCerts.disabled = true;
        createCertsText.innerText = 'Creating Certs...';
        revealElement('#create-certs-spinner');

        try {
            const res = await fetch('/api');
            if(!res.ok) {
                throw new Error('Unable to generate certs');
            }
            const certs = await res.json();
            showCerts(certs);
            console.log({ certs });
        } catch(err) {
            showError(err);
        } finally {
            createCerts.disabled = false;
            createCertsText.innerText = 'Create Certs';
            hideElement('#create-certs-spinner');
        }
    });
};
