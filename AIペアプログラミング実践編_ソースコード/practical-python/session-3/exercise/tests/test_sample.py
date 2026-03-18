"""サンプルテスト"""


def test_one_plus_one_equals_two():
    """1 + 1 = 2 であることを確認"""
    assert 1 + 1 == 2


def test_hello_world():
    """文字列の連結を確認"""
    result = "Hello" + " " + "World"
    assert result == "Hello World"
