const express = require('express')
const passport = require('passport')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express()
app.use(bodyParser.urlencoded({ extended: false })) 
app.use(cookieParser())
app.use(passport.initialize());

// Add this line below
const jwt = require('jsonwebtoken')
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
opts.jwtFromRequest = function(req) {
    var token = null;
    if (req && req.cookies)
    {
        token = req.cookies['jwt'];
    }
    return token;
};
opts.secretOrKey = 'secret';

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    console.log("JWT BASED  VALIDATION GETTING CALLED")
    console.log("JWT", jwt_payload)
    
}));

passport.use(new GoogleStrategy({
    clientID: "899984493909-hqvpg6m1sndfd3onb8hm2krflld0r87j.apps.googleusercontent.com",
    clientSecret: "cVqAVEI9JU5SYWyiTNOOXJuR",
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
      //console.log(accessToken, refreshToken, profile)
      console.log("GOOGLE BASED OAUTH VALIDATION GETTING CALLED")
      return cb(null, profile)
  }
));

passport.serializeUser(function(user, cb) {
    console.log('I should have jack ')
    cb(null, user);
});
  
  passport.deserializeUser(function(obj, cb) {
    console.log('I wont have jack shit')
    cb(null, obj);
});

app.get('/', (req, res)=>{
    res.sendFile('home.html', {root: __dirname+'/public'})
})

app.get('/login', (req, res)=>{
    res.sendFile('login.html', {root: __dirname+'/public'})
})

app.get('/profile', passport.authenticate('jwt', { session: false }) ,(req,res)=>{
    res.write(`My Profile ${req.user.name,req.user.email}`)
})

app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }),
  	function(req,res){
  		console.log(res)
  	});

app.get('/auth/google/callback', passport.authenticate('google'),(req, res)=>{
    console.log('redirected', req.user)
    let user = {
        name: req.user.name.givenName,
        email: req.user._json.email
       }
    console.log(user)
    let token = jwt.sign({
        data: user
        }, 'secret', { expiresIn: '1h' });
    console.log(token)
    res.cookie('jwt', token)
    res.redirect('/')
})


const port = process.env.PORT || 3000
app.listen( port, ()=>{
    console.log(`Sever listening on port ${port}`)
})