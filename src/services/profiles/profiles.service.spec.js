require('dotenv').config();
const UsersRepository = require('../../db/repos/users/index');
const ProfilesService = require('./profiles.service');

describe('PROFILES SERVICE', () => {
  describe('GET PROFILE', () => {
    test('should return profile', async () => {
      jest
        .spyOn(UsersRepository, 'findOneBy')
        .mockReturnValue({ id: 1, following: [2] });

      const profile = await ProfilesService.getProfile(1, 'username');

      expect(profile).toEqual({ id: 1, following: false });
    });

    test("should throw an error if user/profile wasn't found", async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue(null);
      try {
        await ProfilesService.getProfile(1, 'username');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('FOLLOW PROFILE', () => {
    test(`should return a profile with following: true
            if the user is already followed`, async () => {
      jest
        .spyOn(ProfilesService, 'fetchDataFromDB')
        .mockReturnValue([{ following: [3] }, { id: 3 }]);

      const profile = await ProfilesService.followProfile(1, 'username');

      expect(profile).toEqual({ id: 3, following: true });
    });

    test('should follow a profile', async () => {
      jest
        .spyOn(UsersRepository, 'follow')
        .mockImplementation(() => Promise.resolve());
      jest
        .spyOn(ProfilesService, 'fetchDataFromDB')
        .mockReturnValue([{ following: [3] }, { id: 2 }]);

      const profile = await ProfilesService.followProfile(1, 'username');

      expect(profile).toEqual({ id: 2, following: true });
    });

    test('should throw an error if the user is not authorized', async () => {
      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue(null);
      try {
        await ProfilesService.followProfile(1, 'username');
      } catch (error) {
        expect(error.message).toBe("You're not authorized");
      }
    });
  });
});

describe('UNFOLLOW PROFILE', () => {
  test(`should return a profile with following: false
            if the user is already unfollowed`, async () => {
    jest
      .spyOn(ProfilesService, 'fetchDataFromDB')
      .mockReturnValue([{ following: [] }, { id: 2 }]);

    const profile = await ProfilesService.unfollowProfile(1, 'username');

    expect(profile).toEqual({ id: 2, following: false });
  });

  test('should unfollow a profile', async () => {
    jest
      .spyOn(UsersRepository, 'unfollow')
      .mockImplementation(() => Promise.resolve());
    jest
      .spyOn(ProfilesService, 'fetchDataFromDB')
      .mockReturnValue([{ following: [2] }, { id: 2 }]);

    const profile = await ProfilesService.unfollowProfile(1, 'username');

    expect(profile).toEqual({ id: 2, following: false });
  });

  test('should throw an error if the user is not authorized', async () => {
    jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue(null);
    try {
      await ProfilesService.unfollowProfile(1, 'username');
    } catch (error) {
      expect(error.message).toBe("You're not authorized");
    }
  });
});
