const { User } = require('../models');
const { AuthenticationError, signToken } = require('../utils/auth');
const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return await User.findOne({ _id: context.user._id })
            }
            throw AuthenticationError;
        },
    },
    
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {throw AuthenticationError;}

            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {throw AuthenticationError;}

            const token = signToken(user);

            return { token, user };
        },
        
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        
        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData } },
                    { new: true }
                );
                return updatedUser;
            }
            throw AuthenticationError;
        },
        
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } }
                );
                return updatedUser;
            }
            throw AuthenticationError;
        },
    },
};

module.exports = resolvers;
