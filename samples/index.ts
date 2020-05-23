import { parse } from '../src/parser/parse';


const code = `
router.get('/endpoint') 
-> timeout(1000)
->
  filter(({req}) => req.query.key === ALICE_KEY),
  filter(({req}) => req.query.key === BOB_KEY),
-> zip
-> tap(([alice, bob]) => {
  alice.res.send('You guys made it!');
  bob.res.send('You guys made it!');
})
-> retry()
`

parse(code).subscribe(flow => {
  console.log(flow.sources[0].out[0]);
});
