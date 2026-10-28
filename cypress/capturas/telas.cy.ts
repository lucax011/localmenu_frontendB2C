import { API, comToken } from '../support/e2e';

// Gera as capturas do README em docs/capturas, no tamanho de um celular (390 × 844).
// npm run capturas  (com a API e o app web rodando)
const shot = (name: string) => cy.screenshot(name, { capture: 'viewport', overwrite: true });

describe('Capturas das telas', () => {
  beforeEach(() => cy.viewport(390, 844));

  it('jornada no celular', () => {
    cy.visit('/');
    cy.contains('Brasa Burger');
    cy.wait(1500); // fotos das capas
    shot('restaurantes');

    cy.contains('Brasa Burger').click();
    cy.contains('Brasa Clássico');
    cy.wait(1500);
    shot('cardapio');

    cy.contains('Batata rústica').click();
    cy.contains('[role=button]', 'Adicionar ·');
    cy.wait(800);
    shot('detalhe-do-prato');
    cy.contains('[role=button]', 'Adicionar ·').click();
    cy.get('[aria-label="Adicionar Brasa Clássico"]').click();
    cy.contains('[role=button]', 'Acompanhamentos').click();
    cy.wait(800);
    shot('cardapio-categorias');

    // entra pela API para a captura do carrinho já mostrar "Fazer pedido"
    cy.request('POST', `${API}/auth/login`, {
      email: 'cliente@localmenu.dev',
      password: 'localmenu123',
    }).then(({ body }) => {
      cy.window().then((win) =>
        win.localStorage.setItem(
          'localmenu-b2c-auth',
          JSON.stringify({
            state: {
              accessToken: body.accessToken,
              refreshToken: body.refreshToken,
              user: body.user,
            },
            version: 0,
          })
        )
      );
    });
    cy.visit('/carrinho');
    cy.contains('Fazer pedido');
    shot('carrinho');

    cy.contains('Fazer pedido').click();
    cy.contains('Pagar R$');
    shot('pagamento');
    cy.contains('[role=button]', /^Pagar R\$/).click();
    cy.contains('O restaurante recebeu seu pedido.');

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
    cy.contains('Pronto! Mostre no balcão', { timeout: 20000 });
    shot('acompanhamento');

    cy.visit('/conta');
    cy.contains('Meus pedidos');
    shot('conta');
  });
});
