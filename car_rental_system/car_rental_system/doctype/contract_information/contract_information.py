# Copyright (c) 2024, Zeeshan arif and contributors
# For license information, please see license.txt

import frappe
import erpnext
from datetime import date
from frappe.model.document import Document
from frappe import _, msgprint
from frappe.utils import getdate 



class ContractInformation(Document):
	pass

@frappe.whitelist()
def total_amount(
	name: str | list,
	# rent: int| float,
	# insurance_amt: int | float,
	# salik_charges: int | float,
	# total_extra_kms : int | float,
	# damage_charges: int | float,
	# vat: int | float,
	# paid_amt: int | float,
):

	amount = frappe.get_list(
					'Contract Information',
					filters = [
						['name', '=', name],
					],
					fields=["rent", "insurance_amt", "salik_charges", "total_extra_kms", "damage_charges", "vat", "fine_charges", "paid_amt"]
				)
	
	#frappe.msgprint(_(amount),raise_exception=True)

	if len(amount) > 0:
		total_amount = amount[0].rent + amount[0].insurance_amt + amount[0].salik_charges + amount[0].total_extra_kms + amount[0].damage_charges + amount[0].vat + amount[0].fine_charges + amount[0].paid_amt
		balance = amount[0].paid_amt - total_amount
	else:
		total_amount=0
		balance=0

	response_data = {
		'balance': float(balance),
		'total_amount':float(total_amount),
	}

	return response_data


    
	
    # response_data = {
	# 	'total_amt': total_amt,
	# 	'balance': balance
	# }
     
    # return response_data