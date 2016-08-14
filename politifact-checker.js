const request       = require( 'superagent' );
const cheerio       = require( 'cheerio' );
const ask           = require( 'prompt-autocomplete' );
const chalk         = require( 'chalk' );
var   personalities = {};
var   names         = [];

function analyzePersonality ( names ) {
  ask( "Pick a person to analyze:", names, ( err, answer ) => {
    if ( err ) throw err;
    request
      .get( "http://politifact.com" + personalities[ answer ] )
      .end( ( err, res ) => {
        $ = cheerio.load( res.text );
        var weighted = 0;
        var sum = 0;
        $( ".chartlist__item" ).each( ( k, v ) => {
          weighted += Number(v.children[2].children[0].data.split(" ")[0]) * (5 - k);
          sum += Number(v.children[2].children[0].data.split(" ")[0]);
        });
        var ratings = ["Pants on Fire", "False", "Mostly False", "Half True", "Mostly True", "True"];
        process.stdout.write( "\u001b[2J\u001b[0;0H" );
        console.log( chalk.yellow.underline.bold( answer ) );
        console.log( chalk.white( "http://politifact.com" + personalities[ answer ] ), "\n" );
        console.log( chalk.cyan.bold( "Total number of statements:" ), sum );
        console.log( chalk.cyan.bold( "Average rating (0-5, 5 being true, 0 being pants on fire):" ), sum > 0 ? weighted / sum : "N/A" );
        console.log( chalk.cyan.bold( "Average claim rating:" ), sum > 0 ? ratings[ Math.round( weighted/sum ) ] : 'N/A' );
      });
  });
};

request
  .get( "http://politifact.com/personalities/" )
  .end( ( err, res ) => {
    if ( err ) throw err;
    var $ = cheerio.load( res.text );
    $( ".az-list__item" ).each( ( k, v ) => {
      personalities[v.children[1].children[0].data.replace( /\s+/, ' ' ).trim()] = v.children[1].attribs.href;
    });
    $( ".mugshot" ).each( ( k, v ) => {
      personalities[v.children[3].children[0].children[0].data.replace( /\s+/, ' ').trim()] = v.children[3].children[0].attribs.href;
    });
    names = Object.keys( personalities ).sort();
    analyzePersonality( names );
  });
