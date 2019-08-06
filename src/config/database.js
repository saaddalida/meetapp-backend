module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgress',
  password: 'password',
  database: 'meetapp',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
