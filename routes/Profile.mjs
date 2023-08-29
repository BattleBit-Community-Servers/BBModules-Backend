
const func = async (req, res) => {
  try {
    res.status(200).json(req.session);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const type = "GET";
const url = '/profile';
const auth = true;
export { func , type, url, auth };