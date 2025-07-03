import partner from 'app/modules/partner/partner.reducer';
import customer from 'app/modules/customer/customer.reducer';
import document from 'app/modules/document/document.reducer';
import faceMatch from 'app/modules/face-match/face-match.reducer';
import regulation from 'app/modules/regulation/regulation.reducer';
/* jhipster-needle-add-reducer-import - JHipster will add reducer here */

const entitiesReducers = {
  partner,
  customer,
  document,
  faceMatch,
  regulation,
  /* jhipster-needle-add-reducer-combine - JHipster will add reducer here */
};

export default entitiesReducers;
