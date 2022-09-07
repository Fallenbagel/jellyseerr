import './commands';

before(() => {
  if (Cypress.env('SEED_DATABASE')) {
    cy.exec('yarn cypress:prepare');
  }
});
