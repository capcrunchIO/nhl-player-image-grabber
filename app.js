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
  .wait(2000)
  .evaluate(function(fname, lname, err_sel, res_sel) {
    var res = [0, '', ''];
    // no results found
    if ($(err_sel).css('display') === 'block') { res[0] = 'NOT_FOUND'; }
    // results found
    else if ($(res_sel).css('display') === 'table') {
      var player_name = fname.replace(/'/g, '') + '-' + lname.replace(/'/g, '') + '-',
          link_rx = new RegExp(player_name, 'g');
      // scan results
      $('.results-table tbody tr').each(function(i) {
        var url = $(this).find('td > a').attr('href'),
            src = $(this).find('td > a > img').attr('src').replace('.jpg', '.png');
        // find image url
        if (link_rx.test(url)) {
          // default image found
          if (/(skater|goalie)/.test(src)) {
            // check next player row
            var alt_url = $(this).next().find('td > a').attr('href'),
                alt_src = $(this).next().find('td > a > img').attr('src').replace('.jpg', '.png');
                alt_rx = new RegExp(player_name, 'g');
            if (alt_rx.test(alt_url) && !/(skater|goalie)/.test(alt_src)) {
              res = ['IMG_FOUND', alt_src, alt_url, '*'];
            } else { res = ['DEFAULT_IMG', src, url]; }
          } else { res = ['IMG_FOUND', src, url]; }
          return false;
        }
      });
    }
    return res;
  }, fname, lname, err_sel, res_sel)
  .then(function(res) {
    var chain = horseman;
    // no results found
    if (res[0] === 'NOT_FOUND') { console.log('NOT_FOUND'); }
    // scan alt player page
    else if (res[0] === 'DEFAULT_IMG') {
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
    } else if (res[0] === 'IMG_FOUND') {
      if (res[3] === '*') { console.log(res[3] + ' ' + res[1]); }
      else { console.log(res[1]); }
    }
    else { console.log('CONNECTION_ERROR'); }
    return chain;
  })
  .close();
}
