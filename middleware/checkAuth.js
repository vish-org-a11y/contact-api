const jwt = require('jsonwebtoken')

module.exports = (req,res,next)=>{
    // console.log(req.headers.authorization)
    try{
        const token = req.headers.authorization.split(" ")[1]
        const verify = jwt.verify(token,'sbs_147')
         console.log('Token Verify'+verify);
        if(verify)
        {
            next();
        }
    }
    catch(err)
    {
        return res.status(401).json({
            msg:'invalid token'
        })
    }
}