
const func = async (req, res) => {
  try {
    
    res.status(200).json("ok");
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const metadata = {
  type: 'GET',
  url: '/template',
  auth: false,
  role: [''],
};

export { func, metadata };