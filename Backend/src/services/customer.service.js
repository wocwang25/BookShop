const Customer = require('../models/Customer')
const User = require('../models/User')
const mongoose = require('mongoose');

const CustomerService = {
    async findOrCreateCustomer(name) {
        let customer = await Customer.findOne({ name });
        if (!customer) {
            customer = new Customer({ name });
            await customer.save();
        }
        return customer;
    },

    async findAndUpdateCustomer(name, updateData) {
        const customer = await Customer.findOneAndUpdate(
            { name },
            { $set: updateData }
        )
        if (!customer) {
            throw new Error("Không có dữ liệu khách hàng");
        }
        return customer;
    },

    async getCustomerProfile(customerId) {
        const user = await User.findById(customerId).populate({
            path: 'customerProfile',
            populate: [
                { path: 'salesInvoices' },
                { path: 'rentalInvoices' }
            ]
        });
        if (!user) {
            throw new Error("Không tìm thấy tài khoản khách hàng");
        }
        // Trả về thông tin tài khoản và khách hàng
        return { user };
    },

    async getAllCustomers() {
        const customers = await Customer.find({});
        if (!customers) {
            throw new Error("Không tìm thấy tài khoản khách hàng");
        }
        // Trả về thông tin tài khoản và khách hàng
        return { customers };
    },

    async getCustomerById(customerId) {
        console.log('customerId:', customerId);
        const customer = await Customer.findById(customerId)
            .populate('salesInvoices')
            .populate('rentalInvoices');
        if (!customer) {
            throw new Error("Không tìm thấy khách hàng");
        }
        return { customer };
    },

    async updateCustomerProfile(userId, updateData) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const user = await User.findById(userId).session(session);
            if (!user) {
                throw new Error("Không tìm thấy tài khoản người dùng.");
            }

            if (user.role !== 'customer') {
                throw new Error("Chỉ tài khoản khách hàng mới có hồ sơ để cập nhật.");
            }
            if (!user.customerProfile) {
                throw new Error("Hồ sơ khách hàng chưa được liên kết với tài khoản.");
            }

            // Separate User fields from Customer fields
            const userFields = {};
            const customerFields = {};
            
            Object.keys(updateData).forEach(key => {
                if (['name', 'email'].includes(key)) {
                    userFields[key] = updateData[key];
                } else {
                    customerFields[key] = updateData[key];
                }
            });
            
            // Check email uniqueness if email is being updated
            if (userFields.email && userFields.email !== user.email) {
                const existingUserWithEmail = await User.findOne({ email: userFields.email }).session(session);
                if (existingUserWithEmail && !existingUserWithEmail._id.equals(user._id)) {
                    throw new Error("Email này đã được sử dụng bởi tài khoản khác.");
                }
            }
            
            // Update User fields if any
            if (Object.keys(userFields).length > 0) {
                await User.findByIdAndUpdate(
                    user._id,
                    { $set: userFields },
                    { new: true, session }
                );
            }
            
            // Update Customer fields if any
            if (Object.keys(customerFields).length > 0) {
                await Customer.findByIdAndUpdate(
                    user.customerProfile,
                    { $set: customerFields },
                    { new: true, session }
                );
            }

            await session.commitTransaction();

            const updatedProfile = await this.getCustomerProfile(userId);
            return updatedProfile;

        } catch (error) {
            await session.abortTransaction();
            console.error(`Error in updateCustomerProfile for userId ${userId}:`, error);
            throw error;
        } finally {
            session.endSession();
        }
    },


};

module.exports = CustomerService;