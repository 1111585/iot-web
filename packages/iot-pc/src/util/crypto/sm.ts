import { sm2, sm3, sm4 } from 'sm-crypto'

/**
 * Qwen3-Coder 生成
 *
 * 基于 sm-crypto 库的国密算法封装类
 * 提供 SM2、SM3、SM4 算法的加解密功能
 */
class SmCrypto {
  /**
   * SM3 哈希算法
   * @param data 要哈希的数据
   * @param key 可选的 HMAC 密钥
   * @returns 哈希结果
   */
  static sm3Hash(data: string, key?: string): string {
    if (key) {
      return sm3(data, { key })
    }
    return sm3(data)
  }

  /**
   * SM2 生成密钥对
   * @returns 包含公钥和私钥的对象
   */
  static generateSm2KeyPair(): { publicKey: string; privateKey: string } {
    const keypair = sm2.generateKeyPairHex()
    return {
      publicKey: keypair.publicKey,
      privateKey: keypair.privateKey
    }
  }

  /**
   * SM2 公钥加密
   * @param data 要加密的数据
   * @param publicKey 公钥
   * @returns 加密后的数据
   */
  static sm2Encrypt(data: string, publicKey: string): string {
    return sm2.doEncrypt(data, publicKey, 1) // 1 表示 C1C3C2 格式
  }

  /**
   * SM2 私钥解密
   * @param encryptedData 已加密的数据
   * @param privateKey 私钥
   * @returns 解密后的数据
   */
  static sm2Decrypt(encryptedData: string, privateKey: string): string {
    return sm2.doDecrypt(encryptedData, privateKey, 1) // 1 表示 C1C3C2 格式
  }

  /**
   * SM2 签名
   * @param data 要签名的数据
   * @param privateKey 私钥
   * @param publicKey 公钥
   * @returns 签名结果
   */
  static sm2Sign(data: string, privateKey: string, publicKey: string): string {
    const hash = this.sm3Hash(data)
    return sm2.doSignature(hash, privateKey, {
      publicKey,
      hash: true
    })
  }

  /**
   * SM2 验签
   * @param data 原始数据
   * @param signature 签名
   * @param publicKey 公钥
   * @returns 验签结果
   */
  static sm2Verify(data: string, signature: string, publicKey: string): boolean {
    const hash = this.sm3Hash(data)
    return sm2.doVerifySignature(hash, signature, publicKey, {
      hash: true
    })
  }

  /**
   * SM4 加密（ECB 模式）
   * @param data 要加密的数据
   * @param key 密钥 (16字节)
   * @returns 加密后的数据
   */
  static sm4Encrypt(data: string, key: string): string {
    return sm4.encrypt(data, key)
  }

  /**
   * SM4 解密（ECB 模式）
   * @param encryptedData 已加密的数据
   * @param key 密钥 (16字节)
   * @returns 解密后的数据
   */
  static sm4Decrypt(encryptedData: string, key: string): string {
    return sm4.decrypt(encryptedData, key)
  }

  /**
   * SM4 加密（CBC 模式）
   * @param data 要加密的数据
   * @param key 密钥 (16字节)
   * @param iv 初始化向量 (16字节)
   * @returns 加密后的数据
   */
  static sm4EncryptCbc(data: string, key: string, iv: string): string {
    return sm4.encrypt(data, key, {
      mode: 'cbc',
      iv
    })
  }

  /**
   * SM4 解密（CBC 模式）
   * @param encryptedData 已加密的数据
   * @param key 密钥 (16字节)
   * @param iv 初始化向量 (16字节)
   * @returns 解密后的数据
   */
  static sm4DecryptCbc(encryptedData: string, key: string, iv: string): string {
    return sm4.decrypt(encryptedData, key, {
      mode: 'cbc',
      iv
    })
  }
}

// 使用示例：
// const hash = SmCrypto.sm3Hash('hello world');
// const hashWithKey = SmCrypto.sm3Hash('hello world', 'secretKey');
// const keyPair = SmCrypto.generateSm2KeyPair();
// const encrypted = SmCrypto.sm4Encrypt('hello world', '1234567890abcdef');
// const decrypted = SmCrypto.sm4Decrypt(encrypted, '1234567890abcdef');
// const signature = SmCrypto.sm2Sign('hello world', keyPair.privateKey, keyPair.publicKey);
// const isValid = SmCrypto.sm2Verify('hello world', signature, keyPair.publicKey);

export default SmCrypto
