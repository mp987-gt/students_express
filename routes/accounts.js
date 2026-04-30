import express from "express";
const router = express.Router();
import db from "../db/connector.js";

router.get("/", async function (req, res, next) {
  const account = await db.query("SELECT * FROM accounts");
  const rowAccounts = account.rows.map((a) => {
    return {
      ...a,
      adding_time: a.adding_time.toLocaleDateString(),
    };
  });

  res.render("accounts", { accounts: rowAccounts || [] });
});



// CLASSES
class Accounts {
  constructor ({
    id,
    user_name,
    email,
    password,
    adding_time
  }) {
    this.id = id;
    this.user_name = user_name || Unknown;
    this.email = email;
    this.password = password;
    this.adding_time = adding_time
      ? new Date(adding_time).toLocaleString("uk-UA")
      : "Unknown";
  }

   display() {
    console.log(`\n--- [account: ${this.user_name}] ---`);
    console.table({
      "Id": this.id,
      "Username": this.user_name,
      "Email": this.email,
      "password": this.password,
    });
    console.log("Added at:", this.adding_time);
    console.log("-----------------------");
  }
};


class Validator {
    static verUsername(user_name) {
        if (!user_name || typeof user_name !== 'string') {
            return "Username required!";
  }
}
    static  verEmail(email) {
      if (!reason || typeof email !== 'string') {
        return "Reason is required";
  }};

    static verPassword(password) {
        if (!/[A-Z]/.test(password)){
            return "Uppercase letter required!"
        }
        if (!/[0-9]/.test(password)){
            return "At least 1 number required!"
        }
        return null;
    }
};

const watchAccounts = async () => {
  try {
    const result = await db.query(`
      SELECT 
        id,
        email, 
        user_name, 
        password,
        adding_time 
      FROM accounts
    `);

    if (result.rows.length === 0) {
      console.log("\n[DATABASE] OMG where`s your table?");
    } else {
      console.log(`\n[DATABASE] YEEEY, watch accounts below! Now there are ${result.rows.length} of them:`);

      result.rows.forEach((row) => {
        const account = new Accounts(row); 
        account.display();
      });
    }
  } catch (err) {
    console.error(
      "\n[ERROR] data error",
      err.message,
    );
  }
};

watchAccounts();

















// ADD
router.get("/createAccount", async function (req, res, next) {
  res.render("forms/accounts_form", {
    title: "Create Account",
    mode: "form",
    pageTitle: "Add New Account",
    action: "/accounts/createAccount",
    buttonText: "Create",
    item: {},
  });
});

router.post("/createAccount", async function (req, res, next) {
  console.log("Submitted data: ", req.body);

  const { email, user_name, password } = req.body;
  if (!email || !user_name || !password) {
    return res.render("forms/accounts_form", {
      title: "Create Account",
      mode: "form",
      pageTitle: "Add New Account",
      action: "/accounts/createAccount",
      buttonText: "Create",
      error:
        "Some of params are empty. Please, fill the whole form and try again.",
      item: { email, user_name, password },
    });
  }
  async function addAccount(email, user_name, password) {
    try {
      const query = `
      INSERT INTO accounts (email, user_name, password) 
      VALUES ($1, $2, $3) 
      RETURNING *`;
      const res = await db.query(query, [email, user_name, password]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  try {
    await addAccount(email, user_name, password);

    res.redirect("/accounts");
  } catch (err) {
    res.status(500).send("Adding error. Try again");
  }
});

//EDIT
router.get("/edit/:id", async function (req, res, next) {
  try {
    const result = await db.query("SELECT * FROM accounts WHERE id = $1", [
      req.params.id,
    ]);

    const item = result.rows[0];

    if (!item) {
      return res.status(404).render("error", {
        message: "account is not found",
        error: {},
      });
    }

    res.render("forms/accounts_form", {
      title: "Edit accounts",
      mode: "form",
      pageTitle: "Edit accounts",
      action: `/accounts/edit/${item.id}`,
      buttonText: "Save changes",
      item,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/edit/:id", async function (req, res, next) {
  try {
    const { email, user_name } = req.body;
    const { id } = req.params;

    if (!email || !user_name) {
      return res.render("forms/accounts_form", {
        title: "Edit accounts",
        mode: "form",
        pageTitle: "Edit accounts",
        error:
          "Some of params are empty. Please, fill the whole form and try again.",
        item: { id, email, user_name },
        buttonText: "Save changes",
        action: `/accounts/edit/${id}`,
      });
    }

    await db.query(
      `UPDATE accounts SET email = $1, user_name = $2 WHERE id = $3`,
      [email, user_name, id],
    );

    res.redirect("/accounts");
  } catch (err) {
    next(err);
  }
});

// DELETE
router.get("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM accounts WHERE id = $1", [id]);
    res.redirect("/accounts");
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("Could not delete this account");
  }
});

export default router;
