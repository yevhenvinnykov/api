const UsersRepository = require('../../db/users.repository');
const ProfilesService = require('./profiles.service');

describe('PROFILES SERVICE', () => {
  describe('GET PROFILE', () => {
    test('should return profile', async () => {
      jest.spyOn(UsersRepository, 'findOneBy')
          .mockReturnValue({_id: 1, following: [{equals: () => true}]});
      const profile = await ProfilesService.getProfile(1, 'username');
      expect(profile).toEqual({profile: {following: true}});
    });

    test('should throw an error if user/profile wasn\'t found', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue(null);
      try {
        await ProfilesService.getProfile(1, 'username');
      } catch (error) {
        expect(error.message).toBe('User not found');
      }
    });
  });

  describe('FOLLOW PROFILE', () => {
    const userMock = {
      _id: 1,
      following: [{equals: () => true}],
      save: () => {},
    };

    test(`should return a profile with following: true
            if the user is alredy followed`,
    async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue(userMock);
      const profile = await ProfilesService.followProfile(1, 'username');
      expect(profile).toEqual({profile: {following: true}});
    });

    test('should follow a profile', async () => {
      userMock.following[0].equals = () => false;
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue(userMock);
      const profile = await ProfilesService.followProfile(1, 'username');
      expect(profile).toEqual({profile: {following: true}});
    });
  });

  describe('UNFOLLOW PROFILE', () => {
    const userMock = {
      _id: 1,
      following: [{equals: () => false}],
      save: () => {},
    };

    test(`should return a profile with following: false
            if the user is alredy unfollowed`,
    async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue(userMock);
      const profile = await ProfilesService.unfollowProfile(1, 'username');
      expect(profile).toEqual({profile: {following: false}});
    });

    test('should unfollow a profile', async () => {
      userMock.following[0].equals = () => true;
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue(userMock);
      const profile = await ProfilesService.unfollowProfile(1, 'username');
      expect(profile).toEqual({profile: {following: false}});
    });
  });
});

