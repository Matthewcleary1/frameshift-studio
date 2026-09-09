import { test } from 'node:test';
import assert from 'node:assert/strict';
import { briefSchema } from '../lib/brief-schema.ts';

const valid = {
  requestId: '063057ef-8466-4f98-88c8-5cd0b8be40c7', productionType: 'Hybrid production',
  deliverables: ['Brand film'], budget: '€15,000–€30,000', timeline: '1–3 months',
  brief: 'A campaign for a new independent clothing label.', name: 'Test Producer',
  email: 'Producer@Example.com', company: 'Example Studio', consent: true, website: '',
};
test('a complete brief normalizes contact information without discarding the project', () => {
  const value = briefSchema.parse({ ...valid, name: ' Test Producer ' });
  assert.equal(value.email, 'producer@example.com');
  assert.equal(value.name, 'Test Producer');
  assert.equal(value.brief, valid.brief);
});
test('rejects malformed email, insufficient brief and missing contact consent', () => {
  for (const patch of [{email:'not-an-email'}, {brief:'Hi'}, {consent:false}, {name:''}, {requestId:'x'}]) {
    assert.equal(briefSchema.safeParse({...valid,...patch}).success,false);
  }
});
test('enforces bounds on text and permitted commercial choices', () => {
  for (const patch of [{brief:'x'.repeat(5001)}, {company:'x'.repeat(161)}, {budget:'free'}, {productionType:'unknown'}, {deliverables:['malicious data']}, {timeline:''}]) {
    assert.equal(briefSchema.safeParse({...valid,...patch}).success,false);
  }
});
test('does not accept client-provided status or ownership fields', () => {
  const result = briefSchema.parse({...valid,status:'approved',owner_id:'attacker'});
  assert.equal('status' in result,false);
  assert.equal('owner_id' in result,false);
});
