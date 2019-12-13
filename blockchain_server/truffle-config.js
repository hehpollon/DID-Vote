// truffle-config.js
module.exports = {
    networks: {
        klaytn: {
            host: '127.0.0.1',
            port: 8551,
            from: '0xc071d0f18869e8676cf0fca6a687053e2528e767', // 계정 주소를 입력하세요
            network_id: '1001', // Baobab 네트워크 id
            gas: 20000000, // 트랜잭션 가스 한도
            gasPrice: 25000000000, // Baobab의 gasPrice는 25 Gpeb입니다
        },
    },
    compilers: {
      solc: {
        version: "0.4.16"    // 컴파일러 버전을 0.5.6로 지정
      }
  }
};
