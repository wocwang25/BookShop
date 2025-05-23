const User = require('../../../models/User');
const Receipt = require('./receipt.model');
const utils = require('./receipt.utils');
const { DebtReport } = require('../report/report.model');

const receiptService = {
    create: async function (customer_info) {
        const customer = await User.findOne({ name: customer_info.name });
        utils.validateUser(customer);
        utils.validateCustomerDebt(customer, customer_info.deposit);

        const receipt = await new Receipt({
            customer: customer._id,
            address: customer.contact_info?.address || customer_info.address,
            phoneNumber: customer.contact_info?.phone || customer_info.phoneNumber,
            email: customer.email || customer_info.email,
            deposit: customer_info.deposit
        });

        //Lưu lại thông tin để sau đỡ phiền nhập lại
        customer.contact_info.address = receipt.address;
        customer.contact_info.phone = receipt.phone;
        customer.debt -= receipt.deposit;

        const transaction = {
            type: 'payment',
            amount: receipt.deposit,
            customer: customer
        }

        return { receipt, customer, transaction };
    },

    transact: async (transaction, staff_id, session) => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const report = await DebtReport.findOne({ month, year });
        const staff = await User.findById(staff_id);

        if (!report) throw new Error(`No debt report found for ${month}/${year}`);

        const log = report.debt_log.find(log => log.customer.toString() === transaction.customer._id.toString());

        if (log) {
            // Cập nhật tồn kho và thêm giao dịch mới
            log.closing_debt -= transaction.amount;

            log.transactions.push({
                type: 'payment',
                staff: staff.name, //Tên nhân viên nhập
                amount: transaction.amount,
                date: new Date()
            });
        } else {
            throw new Error(`Khách hàng ID "${transactions.addDebt_transaction.customer._id}" chưa được cập nhật trong báo cáo nợ`);
        }


        await report.save({ session });
    },

    get: async function (query) {
        const receipts = await Receipt.find(query)
            .populate({
                path: 'customer',
                select: 'name'
            })
            .sort({ createdAt: -1 });

        const formattedReceipts = receipts.map(receipt => ({
            receiptId: receipt._id,
            customerName: receipt.customer?.name || 'Chưa rõ',
            address: receipt.address || 'Chưa có',
            phone: receipt.phoneNumber || 'Chưa có',
            email: receipt.email || 'Chưa có',
            receiptDate: new Date(receipt.date).toLocaleDateString('vi-VN') || receipt.date,
            totalAmount: receipt.deposit,
            createdAt: receipt.createdAt,
            updatedAt: receipt.updatedAt
        }));

        return formattedReceipts;
    }
}

module.exports = receiptService;