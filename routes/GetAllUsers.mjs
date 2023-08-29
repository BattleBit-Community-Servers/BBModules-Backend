//import User from '../database/models/User.mjs';

const func = async (req, res) => {
  try {
    //const users = await User.getAllUsers();
    const users = []
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const type = "GET";
const url = '/GetAllUsers';
const auth = true;
export { func , type, url, auth };