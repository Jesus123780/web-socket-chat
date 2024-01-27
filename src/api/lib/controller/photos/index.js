export async function updatePhoto(req, res) {
    const { cName, csDescription } = req.body;
    const { fieldname, originalname, filename } = req.file
    try {
        return res.json({
            message: 'Successfully updated',
        });
    } catch (e) {
        return res.json({
            message: e,
        });
    }
}