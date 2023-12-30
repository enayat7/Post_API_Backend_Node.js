import jwt from "jsonwebtoken";

const verifyToken = async (req, res, next) => {
    // console.log(req)
    const bearerHearder = req.headers["authorization"];
    if (typeof bearerHearder != undefined && bearerHearder!=null) {
        try {
        const bearer = bearerHearder.split(' ');
        const token = bearer[1];
        req.token = token;
        await jwt.verify(req.token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
              return res.status(401).json({ message: 'Unauthorized' });
            }
            req.authData = decoded;
            next();
          });
        }
        catch (error) {
        return res.status(401).send({ status: "failed", message: "Unauthorized User" });
        }
    }
    else
    return res.status(401).send({ status: "failed", message: "Unauthorized User, No Token" });
};

export { verifyToken }