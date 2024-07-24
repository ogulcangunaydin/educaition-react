module.exports = {
  apps: [{
    name: 'educaition-react',
    script: './src/index.js'
  }],
  deploy: {
    production: {
      user: 'ec2-user',
      host: 'ec2-54-173-57-250.compute-1.amazonaws.com',
      key: '~/.ssh/educaition-key-pair.pem',
      ref: 'origin/master',
      repo: 'git@github.com:ogulcangunaydin/educaition-react.git',
      path: '/home/ec2-user/educaition-react',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js',
    }
  }
}