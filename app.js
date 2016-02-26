#!/usr/bin/env node

var cli = require('cli'),
    Horseman = require('node-horseman'),
    horseman = new Horseman(),
    options  = cli.parse(),
    err_sel  = '.alert.alert-info.type-ahead-message',
    res_sel  = '.results-table',
    name, fname, lname, ex = ' » [ex: nhlpimg "Wayne Gretzky"]';

cli.main(function(args, options) {
  if (!args[0] || args[0] === '') { console.log('MISSING PLAYER NAME' + ex); process.exit(); }
  else {
    name = args[0].split(' ');
    if (!name[1]) { console.log('MISSING FRIST/LAST NAME' + ex); process.exit(); }
    else {
      fname = name[0].toLowerCase();
      lname = name[1] ? name[1].toLowerCase() : '';
      start();
    }
  }
});

function start() {
  var name = fname + ' ' + lname;
  horseman
  .open('https://www.nhl.com/player')
  .type('#searchTerm', name)
  .wait(1000)
  .evaluate(function(fname, lname, err_sel, res_sel) {
    var url, src = [0, '', 0, fname + ' ' + lname];
    if ($(err_sel).css('display') === 'block') { src[0] = 'NOT_FOUND'; } // no results found
    else if ($(res_sel).css('display') === 'table') { // results found
      var link_rx = new RegExp(fname.replace(/["']/g, '') + '-' + lname.replace(/["']/g, ''), 'g');
      var src_rx = new RegExp('(skater|goalie)', 'g');
      $('.results-table tbody tr td a').each(function(i) { // scan results
        url = $(this).attr('href');
        if (link_rx.test(url)) { // find image url
          src[0] = 'IMG_FOUND';
          src[1] = $('.results-table tbody tr td a:eq('+i+') img').attr('src').replace('.jpg', '.png');
          src[2] = url;
          if (src && src_rx.test(src)) { src[0] = 'DEFAULT_IMG'; } // default image
          return false;
        }
      });
    }
    return src;
  }, fname, lname, err_sel, res_sel)
  .then(function(res) {
    var chain = horseman;
    if (res[0] === 'NOT_FOUND') { console.log('NOT_FOUND'); } // no results found
    else if (res[0] === 'DEFAULT_IMG') { // scan alt player page
      chain = chain
      .open('https://www.nhl.com' + res[2])
      .wait(1000)
      .evaluate(function() {
        var src = $('.player-jumbotron-vitals__headshot img').attr('src').replace('.jpg', '.png');
        if (/(goalie)/.test(src)) { src = 'DEF_IMAGE_GOALIE'; }
        if (/(skater)/.test(src)) { src = 'DEF_IMAGE_SKATER'; }
        return src;
      })
      .then(function(src) { console.log(src); })
    } else if (res[0] === 'IMG_FOUND') { console.log(res[1]); } // image found
    else { console.log('CONNECTION_ERROR'); }
    return chain;
  })
  .close();
}
