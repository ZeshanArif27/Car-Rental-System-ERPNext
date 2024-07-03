# Copyright (c) 2024, Zeeshan arif and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _,msgprint


class Investors(Document):
	pass

@frappe.whitelist()
def total_investment(
	name: str | list,
): 	
	values={
		"name":name
	}
	investment = frappe.db.sql("""SELECT SUM(amt_of_inv) AS investment_sum FROM `tabInvestment Details` tdi WHERE tdi.parent = %(name)s""",values = values, as_dict=1)

	if investment[0].investment_sum is not None:
		investment = float(investment[0].investment_sum)
	else:
		investment = 0

	response_data = {
		'investment': investment
	}
	return response_data


