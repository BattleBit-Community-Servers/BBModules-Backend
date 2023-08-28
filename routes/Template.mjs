
const func = async (req, res) => {
  try {
    
    res.status(200).json("ok");
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const type = "GET";
const url = '/Template';
const tok = false;
export { func , type, url, tok };