function md5(chain, block) {
    return CryptoJS.MD5(getText(chain, block));
}

function sha1(chain, block) {
    return CryptoJS.SHA1(getText(chain, block));
}

function sha256(chain, block) {
    return CryptoJS.SHA256(getText(chain, block));
}

function sha512(chain, block) {
    return CryptoJS.SHA512(getText(chain, block));
}
