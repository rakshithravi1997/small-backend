var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User       = require('../models/user');
var configAuth = require('./auth');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new GoogleStrategy({
        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback: true
        },
        function(req,token, refreshToken, profile, done) {
            process.nextTick(function() {
                User.findOne({ 'google.id' : profile.id }, function(err, user) {
                console.log(profile);
                    if(err)
                        return done(err);
                    if(user) {
                        return done(null, user);
                    } else {
                        var newUser          = new User();
                        newUser.google.id    = profile.id;
                        newUser.google.token = token;
                        newUser.name  = profile.displayName;
                        newUser.email = profile.emails[0].value;
                        newUser.authType = "google";
                        newUser.profilePicUrl = profile.photos[0].value;
                        newUser.profileFilled = false;
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
        }
    ));
};
