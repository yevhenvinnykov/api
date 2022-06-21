require('dotenv').config();
const UsersRepository = require('../../db/repos/users/users.repository');
const ProfilesService = require('./profiles.service');

describe('PROFILES SERVICE', () => {
  describe('GET PROFILE', () => {
    test('should return profile', async () => {
      jest.spyOn(UsersRepository, 'findOneBy')
          .mockReturnValue({id: 1, following: [{toString: () => '1'}]});
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
    test(`should return a profile with following: true
            if the user is alredy followed`,
    async () => {
      jest.spyOn(ProfilesService, 'fetchDataFromDB')
          .mockReturnValue([{following: [{toString: () => '1'}]}, {id: {toString: () => '1'}}]);
      const profile = await ProfilesService.followProfile(1, 'username');
      expect(profile).toEqual({profile: {following: true}});
    });

    test('should follow a profile', async () => {
      jest.spyOn(UsersRepository, 'follow').mockReturnValue(null);
      jest.spyOn(ProfilesService, 'fetchDataFromDB')
          .mockReturnValue([{following: [{toString: () => '1'}]}, {id: {toString: () => '1'}}]);
      const profile = await ProfilesService.followProfile(1, 'username');
      expect(profile).toEqual({profile: {following: true}});
    });
  });
});

describe('UNFOLLOW PROFILE', () => {
  test(`should return a profile with following: false
            if the user is alredy unfollowed`,
  async () => {
    jest.spyOn(ProfilesService, 'fetchDataFromDB')
        .mockReturnValue([{following: [{toString: () => '1'}]}, {id: {toString: () => '2'}}]);
    const profile = await ProfilesService.unfollowProfile(1, 'username');
    expect(profile).toEqual({profile: {following: false}});
  });

  test('should unfollow a profile', async () => {
    jest.spyOn(UsersRepository, 'unfollow').mockReturnValue(null);
    jest.spyOn(ProfilesService, 'fetchDataFromDB')
        .mockReturnValue([{following: [{toString: () => '1'}]}, {id: {toString: () => '1'}}]);
    const profile = await ProfilesService.unfollowProfile(1, 'username');
    expect(profile).toEqual({profile: {following: false}});
  });
});


