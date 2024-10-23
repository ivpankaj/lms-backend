import { Student } from '../models/userModel';
export const createUser = async (data: any, options: { isPaymentDone: boolean }) => {
  const studentData = {
    ...data,
    isPaymentDone: options.isPaymentDone,
  };

  return Student.create(studentData);
};

export const findAllUsers = async () => {
  return Student.findAll({
    where: {
      isDeleted: false
    },
    attributes: { exclude: ['password', 'createdAt', 'updatedAt','isDeleted','token','otp'] }
  });
};