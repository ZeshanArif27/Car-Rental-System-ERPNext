# Copyright (c) 2024, Zeeshan arif and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _,msgprint
import json

class VehicleRegistration(Document):
	pass

def calculate_amt_based_on_percent(purchase_value: int | float, percentage: int | float):
	value = float(float(purchase_value) * float(percentage)/100)
	return value

@frappe.whitelist()
def calculate_total_amount(
		purchase_value: float | int,
		car_owner: str | list,
		percent,
		purchase_details
):
	value={'investment':[],'sum_of_percent':0}
	if purchase_value <= 0:
		frappe.msgprint(_("Purchase Value cannot be less than zero."),raise_exception=True)
	else:
		if car_owner == 'Company':
			total_amount = calculate_amt_based_on_percent(purchase_value,100)
			return total_amount
		
		else:
			value=calculate_investments(car_owner,purchase_details,purchase_value,value,percent)

			if value['sum_of_percent'] > 100:
				frappe.msgprint(_("Sum of Percentage cannot be greater than zero."),raise_exception=True)

			return value

def calculate_investments(car_owner,purchase_details,purchase_value,value,percent):
	seen = []
	for investors in  json.loads(purchase_details):
		if investors.get('investor_id') is None:
			frappe.msgprint(_(f"Investor is missing"),raise_exception=True)
		elif investors.get('investor_id') in seen or investors.get('inv_percentage',0) <= 0:
			frappe.msgprint(_("Investor already exist or investment percentage is zero"),raise_exception=True)
		else:
			seen.append(investors.get('investor_id'))
			
		# frappe.msgprint(_(investors),raise_exception=True)
		get_percent = investors.get('inv_percentage')
		invested_amount = calculate_amt_based_on_percent(purchase_value,get_percent)

		investment_details = {
			'investor_id': investors.get('investor_id'),
			'get_percent': get_percent,
			'invested_amount':invested_amount
		}
		value['investment'].append(investment_details)
		value['sum_of_percent'] += get_percent

	if car_owner == 'Both':
		value['sum_of_percent'] += float(percent)
		value['amount'] = calculate_amt_based_on_percent(purchase_value,percent)


	return value

