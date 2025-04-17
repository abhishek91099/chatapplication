from flask_login import UserMixin
from sqlalchemy import Column, Integer, String, DateTime, func, Text, ForeignKey, LargeBinary
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(UserMixin, Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(50), nullable=False, unique=True)
    password = Column(String(100), nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'

class Chats(Base):
    __tablename__ = 'chats'

    id = Column(Integer, primary_key=True)
    sender = Column(String(50), nullable=False)
    receiver = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, server_default=func.now(), nullable=False)

    def __repr__(self):
        return f'<Chat {self.id}>'

class Profile(Base):
    __tablename__ = 'profile'

    id = Column(Integer, primary_key=True)
    username = Column(String, ForeignKey('users.username'))
    profile_picture = Column(LargeBinary, nullable=True)
    about_me = Column(Text, nullable=True, default=" ")

    def __repr__(self):
        return f'<Profile {self.username}>'
