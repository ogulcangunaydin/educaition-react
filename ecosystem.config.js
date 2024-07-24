module.exports = {
  deploy: {
    production: {
      user: 'ec2-user',
      host: 'ec2-54-173-57-250.compute-1.amazonaws.com',
      key: '~/.ssh/educaition-key-pair.pem',
      ref: 'origin/main',
      repo: 'git@github.com:ogulcangunaydin/educaition-react.git',
      path: '/home/ec2-user/educaition-react/'
    }
  }
}