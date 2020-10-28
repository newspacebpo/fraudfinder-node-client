'use strict';

const axios = require('axios');
const FraudFinderError = require('./util/ff-error');
const moment = require('moment');

module.exports = class FraudFinder {
    constructor(token, url, version) {
        this._token = token || process.env.FRAUDFINDER_TOKEN;

        // if (!this._token) {
        //     throw FraudFinderError('FF-001');
        // }

        this._version = version || 'v1.0';
        this._url = url || 'https://api.fraudfinder.com.br';
    }

    _pausa(duracao) {
        duracao = duracao || 1;
        duracao = duracao * 1000;

        return new Promise((resolve, reject) => {
            setTimeout(resolve, duracao);
        })
    }

    async _resultadoPesquisa(idrequisicao) {
        let resp;

        const config = {
            method: 'get',
            url: `${this._url}/resultadopesquisa/${idrequisicao}`,
            headers: {
                'api-version': this._version,
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            data: null
        };

        try {
            resp = await axios(config);
        } catch(err) {
            console.error(err)
            resp = {
                status: 404
            }
        }

        return resp;
    }
    //--------------------------------------------------------------
    // Autenticar o usuário                                        -
    //--------------------------------------------------------------
    async autenticar(usuario, senha) {
        const config = {
            method: 'post',
            url: `${this._url}/autenticar`,
            headers: {
                'api-version': this._version,
                'Content-Type': 'application/json'
            },
            data: {
                usuario: usuario,
                password: senha
            }
        };

        try {
            let resp = await axios(config)
            resp.data.profile.ultimoAcesso = moment(resp.data.profile.ultimoAcesso);
            resp.data.profile.senhaValidaAte = moment(resp.data.profile.senhaValidaAte);
            
            return { jwt: resp.data.jwt, profile: resp.data.profile };
        } catch (err) {
            // console.log(`E R R O: ${JSON.stringify(err.response, null, 4)}`)
            // console.log(err)
            if (err.response) {
                switch(err.response.status) {
                    case 403:
                        throw FraudFinderError('FF-003', err.response.data.mensagem);
                        break;
                    case 409:
                        throw FraudFinderError('FF-003', err.response.data.mensagem);
                        break;
                    default:
                        throw new Error('Erro desconhecido');
                        break;
                }
            }
        }
    }
    //--------------------------------------------------------------
    // Auterizar o usuário                                         -
    //--------------------------------------------------------------
    async autorizar(idcliente) {
        return;
    }
    //--------------------------------------------------------------
    // Pesquisar CPF na base                                       -
    //--------------------------------------------------------------
    async findCPF(cpf, nascimento) {
        const config = {
            method: 'post',
            url: `${this._url}/findcpf`,
            headers: {
                'api-version': this._version,
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            data: {
                cpf: cpf,
                nascimento: nascimento
            }
        };

        try {
            let resp = await axios(config)

            switch(resp.status) {
                case 200:
                    resp.data.dados.nascimento = moment.utc(resp.data.dados.nascimento).format('DD/MM/yyyy');
                    break;
                case 202:
                    let idRequisicao = resp.data.dados.idRequisicao;

                    while (resp.status !== 200) {
                        await this._pausa(5);
                        resp = await this._resultadoPesquisa(idRequisicao)
                    }
                    break;
                default:
                    resp = null;
            }
            
            return resp;
        } catch (err) {
            throw FraudFinderError('FF-002');
        }
    }
}