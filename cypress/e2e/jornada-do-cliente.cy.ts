import { API, comToken } from '../support/e2e';

describe('Jornada do cliente', () => {
  it('escolhe, cria conta, pede, paga e acompanha até pronto para retirada', () => {
    const email = `cliente.e2e.${Date.now()}@localmenu.dev`;

    // Vitrine e cardápio, sem conta
    cy.visit('/');
    cy.contains('Peça para retirar');
    cy.contains('Brasa Burger').click();
    cy.contains('Brasa Clássico');
    cy.get('[aria-label="Adicionar Brasa Clássico"]').click();
    cy.get('input[placeholder="Buscar no cardápio"]').type('batata');
    cy.contains('Brasa Clássico').should('not.exist');
    // pelo detalhe do prato, que sobe de baixo
    cy.contains('Batata rústica').click();
    cy.contains('[role=button]', 'Adicionar · R$ 18,00').click();

    // Carrinho
    cy.contains('Ver carrinho · 2 itens · R$ 50,90').click();
    cy.get('textarea').type('sem cebola');

    // Conta nova sem perder o carrinho
    cy.contains('Entrar para fazer o pedido').click();
    cy.contains('[role=button]', 'Criar conta').click();
    cy.get('[data-testid=campo-name]').type('Cliente E2E');
    cy.get('[data-testid=campo-email]').type(email);
    cy.get('[data-testid=campo-password]').type('senha123');
    cy.get('[role=button]:contains("Criar conta")').last().click();

    // Pedido e pagamento simulado
    cy.contains('Fazer pedido · R$ 50,90').click();
    cy.contains(/Pedido #\S+ criado/);
    cy.contains('Pagar R$ 50,90').click();
    cy.contains('O restaurante recebeu seu pedido.');
    cy.contains('Pago com pix (simulado)');
    cy.contains('Observações: sem cebola');

    // O restaurante prepara (pela API, como o app do restaurante faria)
    cy.location('pathname').then((path) => {
      const orderId = path.split('/').pop();
      cy.request('POST', `${API}/auth/login`, {
        email: 'dono@localmenu.dev',
        password: 'localmenu123',
      }).then(({ body }) => {
        for (const status of ['PREPARING', 'READY']) {
          cy.request({
            method: 'PATCH',
            url: `${API}/orders/${orderId}/status`,
            headers: comToken(body.accessToken),
            body: { status },
          });
        }
      });
    });

    // A tela do pedido atualiza sozinha
    cy.contains('Pode buscar no balcão', { timeout: 20000 });
    cy.contains('Pronto para retirada');

    // E aparece em "Meus pedidos"
    cy.visit('/pedidos');
    cy.contains('Em andamento');
    cy.contains('Brasa Burger');
  });
});
