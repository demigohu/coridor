import { randomUUID } from "crypto";

/** @type {Map<string, object>} */
const customers = new Map();

const REQUIRED_DEPOSIT = {
  first_name: { description: "Nama depan", optional: false },
  last_name: { description: "Nama belakang", optional: false },
  email_address: { description: "Email", optional: false },
  mobile_number: { description: "Nomor HP (08xx)", optional: false },
};

const REQUIRED_WITHDRAW = {
  ...REQUIRED_DEPOSIT,
  bank_name: { description: "Nama bank", optional: false },
  bank_account_number: { description: "Nomor rekening", optional: false },
};

export async function getCustomer(query) {
  const id = query.id;
  const account = query.account;
  const type = query.type || "sep24-deposit";

  let customer = id ? customers.get(id) : null;
  if (!customer && account) {
    customer = [...customers.values()].find((c) => c.stellar_account === account);
  }

  if (!customer) {
    return {
      status: "NEEDS_INFO",
      fields: type.includes("withdraw") ? REQUIRED_WITHDRAW : REQUIRED_DEPOSIT,
    };
  }

  return {
    id: customer.id,
    status: customer.status || "ACCEPTED",
    provided_fields: customer.provided_fields,
  };
}

export async function putCustomer(body) {
  const id = body.id || randomUUID();
  const existing = customers.get(id) || { id, provided_fields: {} };

  existing.stellar_account = body.account || existing.stellar_account;
  existing.provided_fields = {
    ...existing.provided_fields,
    ...(body.fields || {}),
  };
  existing.status = "ACCEPTED";
  customers.set(id, existing);

  return { id, status: "ACCEPTED" };
}

export function getCustomerById(id) {
  return customers.get(id);
}
