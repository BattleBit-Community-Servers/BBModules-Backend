//GetVersion.mjs








//{"Version_id":1,"Version_module_id":1,"Version_v_number":"0.1.0","Version_file_path":"/path/to/dir","Version_approved":false,"Version_created_at":"2023-08-30T00:24:17.000Z"}
import prisma from '../../database/Prisma.mjs';

const func = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const version = await prisma.versions.findFirst({
      where: {
        Version_id : id,
      },
    });
    res.status(200).json(version);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const type = "GET";
const url = '/GetVersion/:id';
const auth = false;
export { func , type, url, auth };