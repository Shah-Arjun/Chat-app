export const signup = async(req, res) => {
    try {
        const {username, email, password} = req.body
    } catch (err) {
        console.error("Error during signup:", err)
        res.status(500).json({ message: "Internal server error" })
    }
}
