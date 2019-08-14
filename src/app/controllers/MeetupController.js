import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      include: [User],
      limit: 10,
      offset: (page - 1) * 10,
    });

    return res.json(meetups);
  }

  async details(req, res) {
    const meetup = await Meetup.findByPk(req.params.id, {
      include: [
        {
          model: File,
          attributes: ['id', 'path', 'url'],
        },
        User,
      ],
    });
    return res.json(meetup);
  }

  async store(req, res) {
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Meetup date invalid' });
    }

    const user_id = req.userId;

    const meetup = await Meetup.create({
      ...req.body,
      user_id,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const user_id = req.userId;

    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== user_id) {
      return res
        .status(401)
        .json({ error: 'only the creator can update the meetup informations' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: 'cant update past meetups' });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Meetup date invalid' });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const user_id = req.userId;

    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== user_id) {
      return res
        .status(401)
        .json({ error: 'only the creator can cancel the event' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: 'cant delete past meetups' });
    }

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
