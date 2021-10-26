from django.contrib.auth.hashers import BCryptPasswordHasher


class ClarinBCryptSHA256PasswordHasher(BCryptPasswordHasher):
    algorithm = "clarinbcrypt_sha256"


def verify(self, password, encoded):
        bcrypt = self._load_library()
        print("HELLO WORLD", flush=True);
        print(f"VERIFY: '{password}' '{encoded}'", flush=True);
        algorithm, data = encoded.split('$', 1)
        print(f"algorithm: '{algorithm}', data: '{data}' ({self.algorithm})", flush=True);
        assert algorithm == self.algorithm
        print("BEFORE CHECK:", password.encode('ascii'), data.encode('ascii'));
        print("MY CHECK:", bcrypt.checkpw(password.encode('ascii'), data.encode('ascii')));
        return bcrypt.checkpw(password.encode('ascii'), data.encode('ascii'));
       

    