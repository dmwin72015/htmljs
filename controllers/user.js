// Generated by CoffeeScript 1.9.3
(function() {
  var Sina, authorize, config, func_bi, func_card, func_fav, func_index, func_info, func_user, md5, querystring, uuid;

  func_user = __F('user');

  func_card = __F('card');

  func_info = __F('info');

  func_index = __F('index');

  func_fav = __F('user/fav');

  config = require('./../config.coffee');

  authorize = require("./../lib/sdk/authorize.js");

  Sina = require("./../lib/sdk/sina.js");

  func_bi = __F('bi');

  md5 = require('MD5');

  querystring = require('querystring');

  uuid = require('node-uuid');

  module.exports.controllers = {
    "/login": {
      get: function(req, res, next) {
        res.locals.link = authorize.sina({
          app_key: config.sdks.sina.app_key,
          redirect_uri: config.sdks.sina.redirect_uri + (req.query.redirect ? "?redirect=" + req.query.redirect : "?") + (req.query.mini ? "&mini=1" : ""),
          client_id: config.sdks.sina.app_key
        });
        if (req.query.jump) {
          return res.redirect(res.locals.link);
        } else if (req.query.mini) {
          return res.render('minilogin.jade');
        } else {
          return res.render('login.jade');
        }
      }
    },

    "/logout": {
      get: function(req, res, next) {
        res.cookie('_p', "", {
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          httpOnly: true,
          domain: "html-js.com"
        });
        req.session = null;
        return res.redirect(req.query.redirect || '/user');
      }
    },
    "/login.json":{
      post:function(req,res){
        var email = req.body.email;
        var password = req.body.password;
        var nick = req.body.user_nick;
        func_user.getByEmail(email,function(err,user){
            if(user){
              if(user.password == password){
                res.send({
                  success:1,
                  token:user.id + ":" + md5(user.password)
                })
              }else{
                res.send({
                  success:0,
                  info:"密码错误"
                })
              }
            }else{
              //注册用户
              func_user.add({
                email:email,
                password:password,
                user_nick:user_nick
              },function(error,user){
                res.send({
                  success:1,
                  token:user.id + ":" + md5(user.password)
                })
              })
            }
        })
      }
    },
    "/check.json":{
      get:function(req,res){
        var email = req.query.email;
        func_user.getByEmail(email,function(err,user){
          if(user){
            res.send({
                  success:1,
                })
          }else{
            res.send({
                  success:0,
                })
          }
        })
      }
    },
    "/sina_cb": {
      get: function(req, res, next) {
        var _sina, code, link;
        code = req.query.code;
        link = authorize.sina({
          app_key: config.sdks.sina.app_key,
          redirect_uri: config.sdks.sina.redirect_uri + (req.query.redirect ? "?redirect=" + req.query.redirect : "?") + (req.query.mini ? "&mini=1" : ""),
          client_id: config.sdks.sina.app_key
        });
        _sina = new Sina(config.sdks.sina);
        if (!code) {
          res.send('绑定错误:' + error.message + '，请<a href=' + link + '>重新绑定</a>');
          return;
        }
        return _sina.oauth.accesstoken(code, function(error, data) {
          var access_token;
          if (error) {
            return res.send('绑定错误:' + error.message + '，请<a href=' + link + '>重新绑定</a>');
          } else {
            access_token = data.access_token;
            return func_user.getByWeiboId(data.uid, function(error, user) {
              if (user) {
                return user.updateAttributes({
                  weibo_token: access_token
                }).success(function() {
                  res.cookie('_p', user.id + ":" + md5(user.weibo_token), {
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                    httpOnly: true,
                    domain: "html-js.com"
                  });
                  if (!user.email) {
                    res.redirect('/user/email?' + querystring.stringify(req.query));
                    return;
                  }
                  if (req.query.mini) {
                    return res.send('<script>document.domain="html-js.com";parent.window.HtmlJS.util.logincallback&&parent.window.HtmlJS.util.logincallback()</script>');
                  } else {
                    return res.redirect(req.query.redirect || "/user");
                  }
                }).error(function(error) {
                  return res.send('绑定错误:' + error.message + '，请<a href=' + link + '>重新绑定</a>');
                });
              } else {
                return _sina.users.show({
                  access_token: access_token,
                  uid: data.uid,
                  method: "get"
                }, function(error, data) {
                  if (error) {
                    return res.send('绑定错误:' + error.message + '，请<a href=' + link + '>重新绑定</a>');
                  } else {
                    func_user.add({
                      nick: data.screen_name,
                      weibo_id: data.id,
                      weibo_token: access_token,
                      head_pic: data.profile_image_url
                    }, function(error, user) {
                      if (error) {
                        return res.send('绑定错误:' + error.message + '，请<a href=' + link + '>重新绑定</a>');
                      } else {
                        res.cookie('_p', user.id + ":" + md5(user.weibo_token), {
                          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                          httpOnly: true,
                          domain: "html-js.com"
                        });
                        if (!user.email) {
                          res.redirect('/user/email?' + querystring.stringify(req.query));
                          return;
                        }
                        if (req.query.mini) {
                          res.send('<script>parent.window.HtmlJS.util.logincallback&&parent.window.HtmlJS.util.logincallback()</script>');
                        } else {
                          res.redirect(req.query.redirect || "/user");
                        }
                        return sina.statuses.update({
                          access_token: res.locals.user.weibo_token,
                          status: ""
                        });
                      }
                    });
                    return _sina.friendships.create({
                      access_token: access_token,
                      screen_name: "前端乱炖"
                    }, function(error, info) {});
                  }
                });
              }
            });
          }
        });
      }
    },
    "/connet-card": {
      post: function(req, res, next) {
        var result;
        result = {
          success: 0
        };
        if (!res.locals.user) {
          result.info = "登录失效，请重新登录";
          res.send(result);
          return;
        }
        if (res.locals.card) {
          result.info = "您已经关联过名片！";
          res.send(result);
          return;
        }
        return func_user.connectCard(res.locals.user.id, req.body.id, function(error, user, card) {
          var sina;
          if (error) {
            result.info = error.message;
          } else {
            result.success = 1;
          }
          res.send(result);
          if (!error) {
            sina = new Sina(config.sdks.sina);
            sina.statuses.update({
              access_token: res.locals.user.weibo_token,
              status: "我在@前端乱炖 的《前端花名册》认领了我的名片，这里是我的名片，欢迎收藏：http://www.html-js.com/user/" + res.locals.user.id
            });
            (__F('coin')).add(40, res.locals.user.id, "创建了名片");
            return func_index.add(card.uuid);
          }
        });
      }
    },
    "/update": {
      post: function(req, res, next) {
        var result;
        result = {
          success: 0
        };
        return func_card.update(res.locals.card.id, req.body, function(error, card) {
          if (error) {
            result.info = error.message;
          } else {
            result.success = 1;
          }
          return res.send(result);
        });
      }
    },
    "/coinhis": {
      get: function(req, res, next) {
        return res.render('user/coinhis.jade');
      }
    },
    "/bihis": {
      get: function(req, res, next) {
        var result;
        result = {
          success: 0,
          info: ''
        };
        return func_bi.getAll(1, 10, {
          user_id: res.locals.user.id
        }, "id desc", function(error, his) {
          if (error) {
            result.info = error.message;
          } else {
            result.data = his;
            result.success = 1;
          }
          return res.send(result);
        });
      }
    },
    "/myarticles": {
      get: function(req, res, next) {
        return res.render('user/myarticles.jade');
      }
    },
    "/mytopics": {
      get: function(req, res, next) {
        return res.render('user/mytopic.jade');
      }
    },
    "/myqa": {
      get: function(req, res, next) {
        return res.render('user/myqa.jade');
      }
    },
    "/all-users": {
      get: function(req, res, next) {
        return func_user.getAllNames(function(error, usernames) {
          return res.send(usernames);
        });
      }
    },
    "/fav": {
      get: function(req, res, next) {
        var count, page;
        page = req.query.page || 1;
        count = req.query.count || 30;
        return func_fav.count({
          user_id: res.locals.user.id
        }, function(error, _count) {
          if (error) {
            return next(error);
          } else {
            res.locals.total = _count;
            res.locals.totalPage = Math.ceil(_count / count);
            res.locals.page = req.query.page || 1;
            return func_fav.getAll(page, count, res.locals.user.id, function(error, timelines) {
              if (error) {
                return next(error);
              } else {
                res.locals.timelines = timelines;
                return res.render('user/favs.jade');
              }
            });
          }
        });
      },
      post: function(req, res, next) {
        var result;
        result = {
          success: 0,
          info: ""
        };
        return func_fav.add({
          user_id: res.locals.user.id,
          info_id: req.body.uuid
        }, function(error, fav) {
          if (error) {
            result.info = error.message;
          } else {
            result.success = 1;
          }
          return res.send(result);
        });
      }
    },
    "/": {
      get: function(req, res, next) {
        return res.render('user/index.jade');
      }
    },
    "/email": {
      get: function(req, res) {
        res.locals.query = req.query;
        return res.render('user/email.jade');
      },
      post: function(req, res) {
        var result;
        result = {
          success: 0
        };
        if (req.body.email && (req.body.email.indexOf("@") !== -1)) {
          return func_user.update(res.locals.user.id, {
            email: req.body.email
          }, function(error) {
            result.success = 1;
            res.send(result);
          });
        } else {
          result.info = '邮箱格式不正确，请重新填写。';
          return res.send(result);
        }
      }
    },
    "/getappid": {
      get: function(req, res, next) {
        return func_user.getById(res.locals.user.id, function(error, user) {
          if (user.uuid) {
            return res.send({
              user_id: user.id,
              app_id: md5(user.uuid)
            });
          } else {
            return func_user.update(user.id, {
              uuid: uuid.v4()
            }, function(error, user) {
              console.log(user);
              return res.send({
                user_id: user.id,
                app_id: md5(user.uuid)
              });
            });
          }
        });
      }
    },
    "/:id": {
      get: function(req, res, next) {
        res.locals.md5 = md5;
        return func_user.getById(req.params.id, function(error, user) {
          if (error) {
            return next(error);
          } else {
            if (!user) {
              return next(new Error('不存在的用户'));
            } else {
              res.locals.p_user = user;
              if (user.card_id) {
                return res.redirect('/card/' + user.card_id);
              } else {
                return res.render('user/p.jade');
              }
            }
          }
        });
      }
    }
  };

  module.exports.filters = {
    "/": {
      get: ['checkLogin', "checkCard", 'card/visitors', 'user/infos', 'user/article-count', 'user/qa-count', 'user/topic-count']
    },
    "/coinhis": {
      get: ['checkLogin', "checkCard", 'card/visitors', 'user/coinhistories', 'user/article-count', 'user/qa-count', 'user/topic-count']
    },
    "/bihis": {
      get: ['checkLoginJson']
    },
    "/myarticles": {
      get: ['checkLogin', "checkCard", 'card/visitors', 'user/myarticles', 'user/article-count', 'user/qa-count', 'user/topic-count']
    },
    "/mytopics": {
      get: ['checkLogin', "checkCard", 'card/visitors', 'user/mytopics', 'user/article-count', 'user/qa-count', 'user/topic-count']
    },
    "/myqa": {
      get: ['checkLogin', "checkCard", 'card/visitors', 'user/myqa', 'user/article-count', 'user/qa-count', 'user/topic-count']
    },
    "/:id": {
      get: ['freshLogin']
    },
    "/fav": {
      get: ['checkLogin'],
      post: ['checkLoginJson']
    },
    "/connet-card": {
      post: ['checkLoginJson', "checkCard"]
    },
    "/update": {
      post: ['checkLogin', "checkCard"]
    },
    "/email": {
      get: ['checkLogin'],
      post: ['checkLoginJson']
    },
    "/getappid": {
      get: ['checkLogin']
    }
  };

}).call(this);
