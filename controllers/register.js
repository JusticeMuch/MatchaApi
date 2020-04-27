
const User = require('../schemas/user');
const Token = require('../schemas/token');
const {sendEmail} = require('../utils/index');

exports.register = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (user) return res.status(401).json({message: 'The email address you have entered is already associated with another account.'});
        const newUser = new User({ ...req.body, role: "basic" });
        const user_ = await newUser.save();
        await sendVerificationEmail(user_, req, res);

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({msg: 'The email address ' + email + ' is not associated with any account. Double-check your email address and try again.'});

        if (!user.comparePassword(password)) return res.status(401).json({message: 'Invalid email or password'});

        if (!user.isVerified) return res.status(401).json({ type: 'not-verified', message: 'Your account has not been verified.' });

        res.status(200).json({token: user.generateJWT(), user: user});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

exports.verify = async (req, res) => {
    if(!req.params.token) return res.status(400).json({message: "We were unable to find a user for this token."});

    try {
        const token = await Token.findOne({ token: req.params.token });

        if (!token) return res.status(400).json({ message: 'We were unable to find a valid token. Your token my have expired.' });

        User.findOne({ _id: token.userId }, (err, user) => {
            if (!user) return res.status(400).json({ message: 'We were unable to find a user for this token.' });

            if (user.isVerified) return res.status(400).json({ message: 'This user has already been verified.' });

            user.isVerified = true;
            user.save(function (err) {
                if (err) return res.status(500).json({message:err.message});

                res.status(200).send("The account has been verified. Please log in.");
            });
        });
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

exports.resendToken = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.'});

        if (user.isVerified) return res.status(400).json({ message: 'This account has already been verified. Please log in.'});

        await sendVerificationEmail(user, req, res);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

async function sendVerificationEmail(user, req, res){
    try{
        const token = user.generateVerificationToken();

        await token.save();

        let subject = "Account Verification Token";
        let to = user.email;
        let from = process.env.FROM_EMAIL;
        let link="http://"+req.headers.host+"/api/auth/verify/"+token.token;
        let html = `<p>Hi ${user.username}<p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p> 
                  <br><p>If you did not request this, please ignore this email.</p>`;

        await sendEmail({to, from, subject, html});

        res.status(200).json({message: 'A verification email has been sent to ' + user.email + '.'});
    }catch (error) {
        res.status(500).json({message: error.message})
    }
}