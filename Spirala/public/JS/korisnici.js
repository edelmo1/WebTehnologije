module.exports = async (Korisnik) => {
    try {

        console.log("USAOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
      await Korisnik.findOrCreate({
        where: { username: "admin" },
        defaults: {
            ime: "AdminIme",
            prezime: "AdminPrezime",
            username: "admin",
            password: "admin",
            admin: true,
        },
      });
  
      await Korisnik.findOrCreate({
        where: { username: "user" },
        defaults: {
            ime: "UserIme",
            prezime: "UserPrezime",
            username: "user",
            password: "user",
            admin: false,
        },
      });
    } catch (error) {
      console.error("Greška prilikom inicijalizacije korisnika:", error);
    }
  };