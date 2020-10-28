'use strict';

function _ff_error_base(codigo, mensagem) {
    return {
        codigo: codigo,
        mensagem: mensagem || 'Erro no cliente do Fraud Finder'
    }
}
module.exports = function(codigo, mensagem) {
    let erro;

    switch(codigo) {
        case 'FF-001':
            erro = _ff_error_base(codigo, mensagem || 'Token não informado ao criar a instancia do Fraud Finder');;
            break;
        case 'FF-002':
            erro = _ff_error_base(codigo, mensagem || 'Erro ao pesquisar CPF');;
            break;
        case 'FF-003':
            erro = _ff_error_base(codigo, mensagem || 'Usuário ou senha inválido');;
            break;
        default:
            erro = _ff_error_base('FF-999');
            break;
    }

    return erro;
}