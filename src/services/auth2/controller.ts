import { NextFunction, Request, Response } from 'express';
import { User} from '../../models/user.model';

export const create = (req: Request, res: Response, next: NextFunction) => {
	const { account } = req.body;
	if (!account)
		return res
			.status(400)
			.send({ error: 'Request should have account' });

	return (
		User.findOne({ where: { account } })
			////////////////////////////////////////////////////
			// Step 1: Get the user with the given account
			////////////////////////////////////////////////////
			.then((user: User | null) => {
				if (!user) {
					res.status(401).send({
						error: `User with account ${account} is not found in database`,
					});

					return null;
				}

				return user;
			})
			////////////////////////////////////////////////////
			// Step 2: Verify digital signature
			////////////////////////////////////////////////////
			.then((user: User | null) => {
				if (!(user instanceof User)) {
					// Should not happen, we should have already sent the response
					throw new Error(
						'User is not defined in "Verify digital signature".'
					);
				}
				else if(req.session.cookie.path === "/"){
				user.referrer = "null";
				return user.save();
				}
				user.referrer = req.session.cookie.path;
				return user.save();
			})
			.then((user: User) => res.json(user))
			.catch(next)
	);
};