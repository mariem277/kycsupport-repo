import partner from 'app/entities/partner/partner.reducer';
import customer from 'app/entities/customer/customer.reducer';
import document from 'app/entities/document/document.reducer';
import faceMatch from 'app/entities/face-match/face-match.reducer';
import regulation from 'app/entities/regulation/regulation.reducer';
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
