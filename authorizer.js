function contains(a1, a2) {
    let superSet = {};
    for (let i = 0; i < a1.length; i++) {
        const e = a1[i];
        superSet[e] = 1;
    }

    for (let i = 0; i < a2.length; i++) {
        const e = a2[i];
        if (!superSet[e]) {
            return false;
        }
    }
    return true;
}

class Authorizer {


    constructor(requiredScope) {
        this.requiredScope = requiredScope;
        this.authz = false;
        this.authorizeOptions = {
            response_type: 'token',
            redirect_uri: 'https://kaszaq.github.io/miro-chart-importer/authFinished.html'
        };
    }

    async authorized() {
        if (!this.authz) {
            this.authz = contains(await miro.currentUser.getScopes(), this.requiredScope);
            if (!this.authz) {
                authorizer.authorize();
            }
        }

        return this.authz;
    }

    async authorize() {
        return miro.authorize(this.authorizeOptions);
    }
}